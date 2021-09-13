import { NEWS_URL } from "../config";
import { NewsFeedApi } from "../core/api";
import View from "../core/view";
import { NewsFeed } from "../types";

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

class NewsFeedView extends View{
    private api: NewsFeedApi;
    private feeds: NewsFeed[];
  
    constructor(containerId: string) {
      super(containerId, template);
        
      this.api = new NewsFeedApi(NEWS_URL(window.store.currentPage))
      this.feeds = window.store.feeds = this.api.getData();
      this.makeFeed()
      
    }
    
    render(): void {
      const currentHashPage = Number(location.hash.substr(7) || 1);
      
      if(currentHashPage !== window.store.currentPage) {
          window.store.currentPage = currentHashPage;
          this.api = new NewsFeedApi(NEWS_URL(window.store.currentPage))
          this.feeds = window.store.feeds = this.api.getData();
          this.makeFeed()
      } else {
        this.feeds = window.store.feeds
      }
      
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
      this.setTemplateData("prev_page",  String(window.store.currentPage > 1 ? window.store.currentPage - 1 : 1));
      this.setTemplateData("next_page",  String(window.store.currentPage < 10 ? window.store.currentPage + 1 : 10));
  
      this.updateView()
    }
  
  
    makeFeed(): void {
      this.feeds = this.feeds.map((feed) => ({ ...feed, read: false }));
    }
  }

  export default NewsFeedView;