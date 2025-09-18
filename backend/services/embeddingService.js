export const generateEmbeddings = async (texts) => {
  console.log(`Generating embeddings for ${texts.length} texts`);
  return texts.map(() => Array(768).fill(0).map(() => Math.random() - 0.5));
};

export const generateEmbedding = async (text) => {
  console.log(`Generating embedding for: ${text.substring(0, 50)}...`);
  return Array(768).fill(0).map(() => Math.random() - 0.5);
};
