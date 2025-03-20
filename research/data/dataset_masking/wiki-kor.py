import wikipediaapi, requests, os

# 랜덤 문서 제목을 가져오는 함수
def get_random_title():
    url = "https://ko.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "random",
        "rnnamespace": 0,
        "rnlimit": 1
    }

    response = requests.get(url, params=params)
    data = response.json()
    
    if "query" in data and "random" in data["query"]:
        return data["query"]["random"][0]["title"]
    return None

# 길이가 1,000자 이상인 n개의 문서를 folder 하위로 저장하는 함수
def save_wiki_page(n, folder):
    user_agent = "MyWikipediaScraper/1.0 (contact: your_email@example.com)"
    wiki = wikipediaapi.Wikipedia(user_agent=user_agent, language='ko')

    os.makedirs(folder, exist_ok=True)
    
    saved_cnt = 0
    tried_titles = set()

    while saved_cnt < n:
        title = get_random_title()
        if title is None or title in tried_titles:
            continue # 문서 없거나 중복일 경우 추가 X
        tried_titles.add(title)
        page = wiki.page(title)

        if len(page.text) <= 1000:
            print(f"[X] {title} : Too short ({len(page.text)})")
            continue
        filename = f"{folder}/{title}.txt"
        filename = filename.replace(" ", "-")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(page.text)
        saved_cnt += 1
        print(f"[O] {title} : {filename} ({len(page.text)})")

if __name__ == '__main__':
    save_wiki_page(10, "./ko-wiki")