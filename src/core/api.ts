import { NewsDetail, NewsFeed } from "../types";


class Api {
    xhr: XMLHttpRequest;
    url: string;
  
    constructor(url: string) {
      this.xhr = new XMLHttpRequest();
      this.url = url;
    }
  
    getRequestWithXHR<xhrResponse>(cb: (data: xhrResponse) => void): void {
      this.xhr.open("GET", this.url);
      this.xhr.addEventListener("load", () => {
          cb(JSON.parse(this.xhr.response) as xhrResponse)
      })
      this.xhr.send();
    }

    async request<AjaxResponse>(): Promise<AjaxResponse> {
       const response = await fetch(this.url);

       return await response.json() as AjaxResponse;
      }

  }
  
  class NewsFeedApi extends Api{
      constructor(url: string) {
          super(url);
      }

    async getData(): Promise<NewsFeed[]> {
        return this.request<NewsFeed[]>();
    }
  }
  
  class NewsDetailApi extends Api{
      constructor(url: string) {
          super(url);
      }
      async getData(): Promise<NewsDetail> {
        return this.request<NewsDetail>();
    }
  }
  
  export { Api, NewsFeedApi, NewsDetailApi }