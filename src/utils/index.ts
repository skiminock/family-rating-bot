export function getParametrizedString(
  str: string,
  params?: Record<string, string>,
): string {
  if (!str || !params) {
    return '';
  }

  let result = str.replace(/\/\?$/, '');

  if (params) {
    Object.keys(params).forEach((key) => {
      result = result.replace(
        new RegExp(`{{${key}}}`, 'g'),
        String(params[key]),
      );
    });
  }

  return result;
}
