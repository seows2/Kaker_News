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

class View {
  template: string;
  container: HTMLElement;
  htmlList: string[]; 
  
  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if(!containerElement) {
      throw "최상위 컨테이너가 없습니다."
    }

    this.container = containerElement;
    this.template = template;
    this.htmlList = [];
  }

  updateView(html: string): void {
      this.container.innerHTML = html
  }

  addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  getHtml(): string {
    return this.htmlList.join("");
  }
}

class NewsFeedView extends View{
  api: NewsFeedApi;
  feeds: NewsFeed[];

  constructor(containerId: string) {
    const template = `
    <div class="bg-gray-600 min-h-screen">
        <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                            <h1 class="font-extrabold">Kacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                            <a href="#/page/${
                              store.currentPage > 1 ? store.currentPage - 1 : 1
                            }" class="text-gray-500">
                                이전
                            </a>
                            <a href="#/page/${
                              store.currentPage < 10
                                ? store.currentPage + 1
                                : 10
                            }" class="text-gray-500 ml-4">
                                다음
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        <div class="p-4 text-2xl text-gray-700">
        </div>
    </div>
  `;
    super(containerId, template);
    
    this.api = new NewsFeedApi()
    this.feeds = store.feeds ?? this.makeFeed();

    
  }

  render(): void {
    this.feeds
    .forEach(
      ({ id, user, points, time_ago, title, comments_count, read }) => {
        this.addHtml(`
        <div class="p-6 ${
          read ? "bg-gray-300" : "bg-white"
        } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
                <div class="flex-auto">
                    <a href="#/show/${id}">${title}</a>
                </div>
                <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
                </div>
            </div>
            <div class="flex mt-3">
                <div class="grid grid-cols-3 text-sm text-gray-500">
                    <div><i class="fas fa-user mr-1"></i>${user}</div>
                    <div><i class="fas fa-heart mr-1"></i>${points}</div>
                    <div><i class="fas fa-clock mr-1"></i>${time_ago}</div>
                </div>
            </div>
        </div>
      `)}
    )
  }


  makeFeed() :void {
    this.feeds = store.feeds = this.feeds.map((feed) => ({ ...feed, read: false }));
  }
}

class NewsDetailView extends View{
  makeComment(comments: NewsComment[]): string {
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
        commentsString.push(this.makeComment(comment.comments));
      }
    }

    return commentsString.join("");
  };

  render(): void {
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

        ${this.makeComment(newsContents.comments)}
      </div>
    </div>  
  `;

  this.updateView(template)
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

function newsFeeds(currentPage: number) {
  
}

const setEvent = () => {
  window.addEventListener("hashchange", router);
};

async function newsDetail() {
  
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


