/**
 * Template utility for replacing variables in strings
 * Supports both {{variable}} and {variable} syntax
 */

/**
 * Replaces template variables in a string
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns String with variables replaced
 * @example
 * ```ts
 * replaceTemplate('Hello {{name}}', { name: 'World' })
 * // Returns: 'Hello World'
 * ```
 */
export function replaceTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Replaces template variables in an object recursively
 * @param obj - Object or primitive value
 * @param variables - Object containing variable values
 * @returns Object with variables replaced
 */
export function replaceTemplateInObject<T>(obj: T, variables: Record<string, any>): T {
  if (typeof obj === 'string') {
    return replaceTemplate(obj, variables) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceTemplateInObject(item, variables)) as T;
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceTemplateInObject(value, variables);
    }
    return result as T;
  }

  return obj;
}

/**
 * Builds query string from parameters
 * @param params - Parameters object
 * @returns URL-encoded query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        query.append(key, value.join(' '));
      } else {
        query.append(key, String(value));
      }
    }
  }

  return query.toString();
}

/**
 * Builds URL with query parameters
 * @param baseUrl - Base URL
 * @param params - Query parameters
 * @returns Complete URL with query string
 */
export function buildUrl(baseUrl: string, params: Record<string, any>): string {
  const queryString = buildQueryString(params);
  if (!queryString) {
    return baseUrl;
  }
  return `${baseUrl}?${queryString}`;
}
