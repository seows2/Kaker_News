document.addEventListener("DOMContentLoaded", init);

const Container = document.getElementById("root");
const NEWS_URL = (currentPage) =>
  `https://api.hnpwa.com/v0/news/${currentPage}.json`;
const CONTENT_URL = (id) => `https://api.hnpwa.com/v0/item/${id}.json`;
const store = {
  currentPage: 1,
};

function init() {
  newsFeeds(1);
  setEvent();
}

async function newsFeeds(currentPage) {
  const newsFeeds = await getURLdata(NEWS_URL(currentPage));

  Container.innerHTML = `
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
        ${newsFeeds
          .map(
            ({ id, user, points, time_ago, title, comments_count }) => `
            <div class="p-6 bg-white mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
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
          `
          )
          .join("")}
        </div>
    </div>
  `;
}

const setEvent = () => {
  window.addEventListener("hashchange", router);
};

async function newsDetail() {
  const makeComment = (comments) => {
    const commentsString = [];

    for (const comment of comments) {
      commentsString.push(`
        <div style="padding-left: 40px;" class="mt-4">
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
  const newsContents = await getURLdata(CONTENT_URL(id));

  Container.innerHTML = `
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
}

function getURLdata(url) {
  return fetch(url).then((res) => res.json());
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
