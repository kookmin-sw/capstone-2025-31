def delete_newline(text):
    return text.replace('\n', ' ')

def word_sliding_window(documents, window_size=10, slide=1):
    chunks = []
    documents = delete_newline(documents)
    words = [word for word in documents.split(' ') if len(word) > 1]

    if len(words) < window_size:
        chunks.append(' '.join(words))
        return chunks
    
    for i in range(0, len(words)-window_size+1, slide):
        chunk = ' '.join(words[i:i+window_size])
        chunks.append(chunk)

    return chunks