function validObjectId(text: string) {
  const pattern = /[0-9a-fA-F]{24}/;
  const match = text.match(pattern);

  if (!match) return false;
  return match[0] === text;
}

export default validObjectId;
