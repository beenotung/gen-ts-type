import { genFunctionType } from './function-type';
import { isSafeObjectKey, toSafeObjectKey } from './object-key';

type TypeOptions = {
  path: string;
  indent: string;
};

export type ToTypeStringOptions = {
  /** default: false */
  include_sample?: boolean;

  /** default: false */
  semi_colon?: boolean;

  /** default: '  ' (2 spaces) */
  indent_step?: string;
};

export class Type {
  array?: Type[];
  set?: Type[];
  map?: {
    key: Type[];
    value: Type[];
  };
  object?: {
    key: string;
    type: Type;
  }[];
  union_object?: Map<string, Type>[];
  primitive?: unknown[];
  function?: Function[];
  path: string;
  indent: string;
  nullable: boolean = false;
  optional: boolean = false;
  is_object_field: boolean = false;
  /** indicate if this is the first element in array */
  instance_count: number = 1;

  constructor(options: TypeOptions) {
    this.path = options.path;
    this.indent = options.indent;
  }

  toString(options: ToTypeStringOptions = {}): string {
    let types: string[] = [];
    if (this.nullable) {
      types.push('null');
    }
    if (!this.is_object_field && this.optional) {
      types.push('undefined');
    }
    if (this.array) {
      types.push(this.toArrayType(options));
    }
    if (this.set) {
      types.push(this.toSetType(options));
    }
    if (this.map) {
      types.push(this.toMapType(options));
    }
    if (this.object) {
      types.push(this.toObjectType(this.object, options));
    }
    if (this.union_object) {
      types.push(this.toUnionObjectType(options));
    }
    if (this.primitive != undefined) {
      types.push(this.toPrimitiveType(options));
    }
    if (this.function) {
      types.push(this.toFunctionType(options));
    }
    return types.join(' | ');
  }

  private toArrayType(options: ToTypeStringOptions): string {
    return this.toListType('Array', this.array!, options);
  }

  private toSetType(options: ToTypeStringOptions): string {
    return this.toListType('Set', this.set!, options);
  }

  private toMapType(options: ToTypeStringOptions): string {
    let { key, value } = this.map!;
    let keyType =
      key.map(key => key.toString(options)).join(' | ') || 'unknown';
    let valueType =
      value.map(value => value.toString(options)).join(' | ') || 'unknown';
    return `Map<${keyType}, ${valueType}>`;
  }

  private toListType(
    typeName: string,
    array: Array<Type>,
    options: ToTypeStringOptions,
  ): string {
    let indent_step = options.indent_step ?? '  ';
    if (array.length == 0) {
      return `${typeName}<unknown>`;
    }
    if (array.length == 1) {
      return `${typeName}<${array[0].toString(options)}>`;
    }
    let type = `${typeName}<`;
    for (let elementType of array) {
      type += `\n${this.indent}${indent_step}| ${elementType}`;
    }
    type += `\n${this.indent}>`;
    return type;
  }

  private toObjectType(
    object: { key: string; type: Type }[],
    options: ToTypeStringOptions,
  ): string {
    if (object.length == 0) {
      return '{}';
    }
    let indent_step = options.indent_step ?? '  ';
    let type = '{';
    let is_all_key_safe = object.every(field => isSafeObjectKey(field.key));
    for (let field of object) {
      if (options.include_sample && field.type.primitive != undefined) {
        type += `\n${this.indent}  /** e.g. ${JSON.stringify(field.type.primitive)} */`;
      }
      type += `\n${this.indent}${indent_step}`;
      let key = is_all_key_safe ? field.key : toSafeObjectKey(field.key);
      let value = field.type.toString(options);
      if (field.type.optional) {
        type += `${key}?: ${value}`;
      } else {
        type += `${key}: ${value}`;
      }
      if (options.semi_colon) {
        type += `;`;
      }
    }
    type += `\n${this.indent}}`;
    return type;
  }

  private toUnionObjectType(options: ToTypeStringOptions): string {
    return this.union_object!.map(fields =>
      this.toObjectType(
        Array.from(fields, ([key, type]) => ({ key, type })),
        options,
      ),
    ).join(' | ');
  }

  private toPrimitiveType(options: ToTypeStringOptions): string {
    let samples = this.primitive!;
    if (!options.include_sample) {
      return samples.map(to_type_str).join(' | ');
    }
    if (samples.length == 1) {
      return to_primitive_type(samples[0], options);
    }
    let type = '';
    for (let sample of samples) {
      type += `\n${this.indent} | ${to_primitive_type(sample, options)}`;
    }
    return type;
  }

  private toFunctionType(options: ToTypeStringOptions): string {
    let functions = this.function!;
    if (functions.length == 1) {
      return to_func_type(functions[0], options);
    }
    let type = '';
    for (let func of functions) {
      type += `\n${this.indent} | ${to_func_type(func, options)}`;
    }
    return type;
  }
}

export type InferTypeOptions = {
  /** default: '' */
  indent?: string;

  /** default: '  ' (2 spaces) */
  indent_step?: string;

  /**
   * default: false
   *
   * @description collapse all variants of objects in array as union type
   *
   * @example
   * ```typescript
   * const data = [
   *  { name: 'Alice', year: 2000 },
   *  { name: 'Bob', age: 20 },
   * ]
   *
   * // without union_type:
   * type Data = Array<{
   *   name: string
   *   year?: number
   *   age?: number
   * }>
   *
   * // with union_type:
   * type Data = {
   *   name: string
   *   year: number
   * } | {
   *   name: string
   * age: string
   * }
   * ```
   */
  union_type?: boolean;
};

export function inferType(json: unknown, options: InferTypeOptions = {}): Type {
  let union_type = options.union_type;
  let indent_step = options.indent_step ?? '  ';

  let typeCache = new Map<string, Type>();

  function getType(options: TypeOptions) {
    let type = typeCache.get(options.path);
    if (!type) {
      type = new Type(options);
      typeCache.set(options.path, type);
    }
    return type;
  }

  function inferType(json: unknown, indent: string, path: string): Type {
    let type = getType({ path, indent });

    if (json == null) {
      type.nullable = true;
      return type;
    }

    if (json === undefined) {
      type.optional = true;
      return type;
    }

    if (typeof json == 'object') {
      if (Array.isArray(json)) {
        walkArray(json, type);
      } else if (json instanceof Date) {
        addPrimitive(json, type);
      } else if (json instanceof Map) {
        walkMap(json, type);
      } else if (json instanceof Set) {
        walkSet(json, type);
      } else {
        if (union_type) {
          walkUnionObject(json, type);
        } else {
          walkObject(json, type);
        }
      }
    } else {
      addPrimitive(json, type);
    }

    return type;
  }

  function addPrimitive(sample: unknown, type: Type) {
    type.primitive ||= [];
    let type_str = to_type_str(sample);
    if (!type.primitive.some(sample => to_type_str(sample) == type_str)) {
      type.primitive.push(sample);
    }
  }

  function walkObject(object: object, type: Type) {
    let keys = Object.keys(object);
    type.object ||= [];
    for (let key of keys) {
      let value = (object as any)[key];
      let valueType = inferType(
        value,
        type.indent + indent_step,
        `${type.path}['${key}']`,
      );
      valueType.is_object_field = true;
      let field = type.object.find(field => field.key == key);
      if (!field) {
        if (type.instance_count != 1) {
          valueType.optional = true;
        }
        field = { key, type: valueType };
        type.object.push(field);
      }
    }
    for (let field of type.object!) {
      if (!keys.includes(field.key)) {
        field.type.optional = true;
      }
    }
    type.instance_count++;
  }

  function walkUnionObject(object: object, type: Type) {
    let keys = Object.keys(object);
    let fields = new Map<string, Type>();
    for (let key of keys) {
      let value = (object as any)[key];
      let valueType = inferType(
        value,
        type.indent + indent_step,
        `${type.path}['${key}']`,
      );
      valueType.is_object_field = true;
      fields.set(key, valueType);
    }
    type.union_object ||= [];
    let existing_fields = type.union_object.find(existing_fields => {
      if (existing_fields.size != fields.size) return false;
      for (let key of existing_fields.keys()) {
        if (!fields.has(key)) return false;
      }
      for (let key of fields.keys()) {
        let existing_type = existing_fields.get(key);
        if (!existing_type) return false;
        let new_type = fields.get(key);
        if (existing_type.toString() != new_type?.toString()) return false;
      }
      return true;
    });
    if (!existing_fields) {
      type.union_object.push(fields);
    }
    type.instance_count++;
  }

  function walkMap(map: Map<unknown, unknown>, type: Type) {
    type.map ||= {
      key: [],
      value: [],
    };
    for (let [key, value] of map) {
      let keyType = inferType(key, type.indent, `${type.path}@key`);
      let valueType = inferType(value, type.indent, `${type.path}@value`);
      if (!type.map.key.includes(keyType)) {
        type.map.key.push(keyType);
      }
      if (!type.map.value.includes(valueType)) {
        type.map.value.push(valueType);
      }
    }
  }

  function walkArray(array: Array<unknown>, type: Type) {
    type.array ||= [];
    for (let element of array) {
      let elementType = inferType(element, type.indent, `${type.path}[number]`);
      if (!type.array.includes(elementType)) {
        type.array.push(elementType);
      }
    }
  }

  function walkSet(set: Set<unknown>, type: Type) {
    type.set ||= [];
    for (let element of set) {
      let elementType = inferType(element, type.indent, `${type.path}[number]`);
      if (!type.set.includes(elementType)) {
        type.set.push(elementType);
      }
    }
  }

  return inferType(json, options.indent ?? '', '');
}

function to_type_str(sample: unknown): string {
  if (sample == null) return 'null';
  if (sample instanceof Date) return 'Date';
  return typeof sample;
}

function to_primitive_type(sample: unknown, options: ToTypeStringOptions) {
  let type = to_type_str(sample);
  if (options.include_sample) {
    type += ` /** e.g. ${JSON.stringify(sample)} */`;
  }
  return type;
}

function to_func_type(func: Function, options: ToTypeStringOptions) {
  let type = genFunctionType(func);
  if (options.include_sample) {
    type += ` /** e.g. ${func.toString()} */`;
  }
  return type;
}
