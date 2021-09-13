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

interface RouteInfo {
  path: string;
  page: View;
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

abstract class View {
  private template: string;
  private renderTemplate: string;
  private container: HTMLElement;
  private htmlList: string[]; 
  
  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if(!containerElement) {
      throw "최상위 컨테이너가 없습니다."
    }

    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected updateView(): void {
      this.container.innerHTML = this.renderTemplate;
      this.renderTemplate = this.template;
  }

  protected addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  protected getHtml(): string {
    const snapshot = this.htmlList.join("");
    this.clearHtmlList();
    return snapshot;
  }

  protected setTemplateData(key: string, value:string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  private clearHtmlList(): void {
    this.htmlList = []
  }

  abstract render(): void;
}

class NewsFeedView extends View{
  private api: NewsFeedApi;
  private feeds: NewsFeed[];

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
                            <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                                이전
                            </a>
                            <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                                다음
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        <div class="p-4 text-2xl text-gray-700">
            {{__news_feed__}}
        </div>
    </div>
  `;
    super(containerId, template);
      
    this.api = new NewsFeedApi(NEWS_URL(store.currentPage))
    this.feeds = store.feeds = this.api.getData();
    this.makeFeed()
    
  }
  
  render(): void {
    store.currentPage = Number(location.hash.substr(7) || 1);
    
    this.api = new NewsFeedApi(NEWS_URL(store.currentPage))
      this.feeds = store.feeds = this.api.getData();
      this.makeFeed()
    
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

    this.setTemplateData("news_feed", this.getHtml())
    this.setTemplateData("prev_page",  String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    this.setTemplateData("next_page",  String(store.currentPage < 10 ? store.currentPage + 1 : 10));

    this.updateView()
  }


  makeFeed(): void {
    this.feeds = this.feeds.map((feed) => ({ ...feed, read: false }));
  }
}

class NewsDetailView extends View{

  constructor(containerId: string) {
    const template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Kacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href"#/page/{{__currentPage__}}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rouned-xl bg-white m-6 p-4">
        <h2>{{__title__}}</h2>
        <div class="text-gray-400 h-20">
          {{__content__}}
        </div>

        {{__comments__}}
      </div>
    </div>  
  `;

  super(containerId, template)
  }

  makeComment(comments: NewsComment[]): string {
    for (const comment of comments) {
      this.addHtml(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>
      `);

      if (comment.comments.length > 0) {
        this.addHtml(this.makeComment(comment.comments));
      }
    }

    return this.getHtml()
  };

  render(): void {
    const id = location.hash.substr(7);
  
    const api = new NewsDetailApi(CONTENT_URL(id))
    const newsDetail = api.getData(id);
  
    const target = store.feeds.find((feed) => feed.id === Number(id));
    if(target){
      target.read = true;
    }


    this.setTemplateData("comments", this.makeComment(newsDetail.comments));
    this.setTemplateData("currentPage", String(store.currentPage));
    this.setTemplateData("title", newsDetail.title);
    this.setTemplateData("content", newsDetail.content);

    this.updateView()
  }
}

class Router {
  routeTable: RouteInfo[];
  defaultRoute: RouteInfo | null;

  constructor() {
    window.addEventListener("hashchange", this.route.bind(this));
    
    this.routeTable = [];
    this.defaultRoute = null;
  }
  
  setDefaultPage(page: View): void {
    this.defaultRoute = {path: "", page};
  }
  
  addRoutePath(path: string, page: View): void{
    this.routeTable.push({ path, page });
  }
  
  route() {
    const routerPath = location.hash;

    if(routerPath === "" && this.defaultRoute) {
      this.defaultRoute.page.render();
    }
    
    for (const routeInfo of this.routeTable) {
      if(routerPath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }
}

class Api {
  ajax: XMLHttpRequest;
  url: string;

  constructor(url: string) {
    this.ajax = new XMLHttpRequest();
    this.url = url;
  }

  getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open("GET", this.url, false);
    this.ajax.send();

    return JSON.parse(this.ajax.response)
  }
}

class NewsFeedApi extends Api{
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api{
  getData(id: string): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

interface NewsFeedApi extends Api {}
interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);



function init() {
  const router: Router = new Router();
  const newsFeedView = new NewsFeedView("root");
  const newsDetailView = new NewsDetailView("root");
  
  router.setDefaultPage(newsFeedView);

  router.addRoutePath("/page/", newsFeedView);
  router.addRoutePath("/show/", newsDetailView);

  router.route();
}