import Router from "./core/router";
import NewsDetailView from "./page/news-detail-view";
import NewsFeedView from "./page/news-feed-view";
import Store from "./store";
import { NewsStore } from "./types";

document.addEventListener("DOMContentLoaded", init);


function init() {
  const store: NewsStore = new Store();
  const router: Router = new Router();
  const newsFeedView = new NewsFeedView("root", store);
  const newsDetailView = new NewsDetailView("root", store);
  
  router.setDefaultPage(newsFeedView);

  router.addRoutePath("/page/", newsFeedView);
  router.addRoutePath("/show/", newsDetailView);

  router.route();
}