import { CONTENT_URL } from "../config";
import { NewsDetailApi } from "../core/api";
import View from "../core/view";
import { NewsComment } from "../types";

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

class NewsDetailView extends View{

    constructor(containerId: string) {
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
    
      const target = window.store.feeds.find((feed) => feed.id === Number(id));
      if(target){
        target.read = true;
      }

      console.log(target);
      
  
  
      this.setTemplateData("comments", this.makeComment(newsDetail.comments));
      this.setTemplateData("currentPage", String(window.store.currentPage));
      this.setTemplateData("title", newsDetail.title);
      this.setTemplateData("content", newsDetail.content);
  
      this.updateView()
    }
  }

  export default NewsDetailView