document.addEventListener("DOMContentLoaded", init);

interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

interface News  {
  readonly id: number;
  readonly url: string;
  readonly user: string;
  readonly time_ago: string;
  readonly title: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean
}

interface NewsDetail extends News {
  readonly comments: NewsComment[]
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}

const Container: HTMLElement | null = document.getElementById("root");
const NEWS_URL = (currentPage: number) =>
  `https://api.hnpwa.com/v0/news/${currentPage}.json`;
const CONTENT_URL = (id: string) => `https://api.hnpwa.com/v0/item/${id}.json`;
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function applyApiMixins(targetClass: any, baseClasses: any[]): void {
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if(descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor)
      }
    })
  });
}

class NewsFeedView {
  constructor() {
    const api = new NewsFeedApi()
    let newsFeeds: NewsFeed[] = store.feeds;
  
  
      newsFeeds = store.feeds = makeFeed(api.getData());

  }

  render(): void {

  }
}

class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest()
    ajax.open("GET", url, false);
    ajax.send();

    return JSON.parse(ajax.response)
  }
}

class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL(store.currentPage));
  }
}

class NewsDetailApi {
  getData(id: string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL(id));
  }
}

interface NewsFeedApi extends Api {}
interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);



function init() {
  newsFeeds(1);
  setEvent();
}

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {
  return feeds.map((feed) => ({ ...feed, read: false }));
}

function updateView(html: string): void {
  if(Container) {
    Container.innerHTML = html
  }
}

function newsFeeds(currentPage: number) {
  
}

const setEvent = () => {
  window.addEventListener("hashchange", router);
};

async function newsDetail() {
  const makeComment = (comments: NewsComment[]): string => {
    const commentsString = [];

    for (const comment of comments) {
      commentsString.push(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>
      `);

      if (comment.comments.length > 0) {
        commentsString.push(makeComment(comment.comments));
      }
    }

    return commentsString.join("");
  };

  const id = location.hash.substr(7);

  const api = new NewsDetailApi()
  const newsContents = api.getData(id);

  const target = store.feeds.find((feed) => feed.id === Number(id));
  if(target){
    target.read = true;

  }

    const template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Kacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href"#/page/${store.currentPage}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="h-full border rouned-xl bg-white m-6 p-4">
          <h2>${newsContents.title}</h2>
          <div class="text-gray-400 h-20">
            ${newsContents.content}
          </div>
  
          ${makeComment(newsContents.comments)}
        </div>
      </div>  
    `;

    updateView(template)

}


function router() {
  const routerPath = location.hash;
  if (routerPath === "") {
    newsFeeds(1);
  } else if (routerPath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(routerPath.substr(7));
    newsFeeds(store.currentPage);
  } else {
    newsDetail();
  }
}
