import Router from "./core/router";
import NewsDetailView from "./page/news-detail-view";
import NewsFeedView from "./page/news-feed-view";
import { Store } from "./types";

document.addEventListener("DOMContentLoaded", init);


export const store: Store = {
  currentPage: 1,
  feeds: [],
};

declare global {
  interface Window {
    store: Store;
  }
}

window.store = store;

function init() {
  const router: Router = new Router();
  const newsFeedView = new NewsFeedView("root");
  const newsDetailView = new NewsDetailView("root");
  
  router.setDefaultPage(newsFeedView);

  router.addRoutePath("/page/", newsFeedView);
  router.addRoutePath("/show/", newsDetailView);

  router.route();
}