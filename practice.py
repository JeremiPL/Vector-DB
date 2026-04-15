from chromadb.utils import embedding_functions

embedder = embedding_functions.DefaultEmbeddingFunction()

text = "Rough Collie"

result = embedder(text)[0]

print(result)