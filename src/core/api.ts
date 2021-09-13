import { NewsDetail, NewsFeed } from "../types";


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
  
  
  
  interface NewsFeedApi extends Api {}
  interface NewsDetailApi extends Api {}
  
  applyApiMixins(NewsFeedApi, [Api]);
  applyApiMixins(NewsDetailApi, [Api]);
  
  export { Api, NewsFeedApi, NewsDetailApi }