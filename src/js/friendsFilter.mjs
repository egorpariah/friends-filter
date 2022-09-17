import VkApi from './vkApi.mjs';
import List from './ui/list.mjs';

export default class FriendsFilter {
  constructor() {
    this.storage = localStorage;
    this.VkApi = new VkApi(51426176);

    this.ui = {
      friendsList: new List(
        document.querySelector('[data-role="friendsList"]'),
        document.querySelector('[data-role="friends-filter"]'),
        this.onInput.bind(this)
      ),
      filterList: new List(
        document.querySelector('[data-role="filterList"]'),
        document.querySelector('[data-role="list-filter"]'),
        this.onInput.bind(this)
      ),
    };

    this.VkApi.init.then(this.onInit.bind(this));
  }

  async onInit() {
    if (this.storage.lists) {
      const lists = JSON.parse(this.storage.lists);
      this.ui.friendsList.fill(lists.friendsList, 'friend__button', 'friend-move');
      this.ui.filterList.fill(
        lists.filterList,
        'friend__button friend__button--remove',
        'friend-remove'
      );
    } else {
      let data = await this.VkApi.getApi('friends.get', {
        v: 5.131,
        fields: 'photo_50, first_name, last_name',
      });

      const friends = {};
      for (const item of data.items) {
        friends[item.id] = item;
      }
      this.storage.lists = JSON.stringify({
        friendsList: friends,
        filterList: {},
      });
      this.ui.friendsList.fill(data.items, 'friend__button', 'friend-move');
      data = null;
    }
    document.body.addEventListener('click', this.move.bind(this));
    this.makeDnD();
  }

  onInput(list, value) {
    list.innerHTML = '';

    const datarole = list.dataset.role;
    const lists = JSON.parse(this.storage.lists);
    const friends = [];
    let buttonClass;
    let buttonRole;

    for (const id in lists[datarole]) {
      const filterMatch =
        this.isMatching(lists[datarole][id].first_name, value) ||
        this.isMatching(lists[datarole][id].last_name, value);
      if (filterMatch) {
        friends.push(lists[datarole][id]);
      }
    }

    if (datarole === 'friendsList') {
      [buttonClass, buttonRole] = ['friend__button', 'friend-move'];
    } else {
      [buttonClass, buttonRole] = [
        'friend__button friend__button--remove',
        'friend-remove',
      ];
    }

    return [friends, ...[buttonClass, buttonRole]];
  }

  move(e) {
    e.preventDefault();

    if (e.target.dataset.role === 'friend-move') {
      e.target.dataset.role = 'friend-remove';
      e.target.classList.add('friend__button--remove');
      if (this.ui.filterList.filter.value === '') {
        this.ui.filterList.list.append(e.target.parentElement);
      } else {
        e.target.parentElement.remove();
      }
      this.refreshStorage(true, e.target.parentElement.dataset.id);
    } else if (e.target.dataset.role === 'friend-remove') {
      e.target.dataset.role = 'friend-move';
      e.target.classList.remove('friend__button--remove');
      if (this.ui.friendsList.filter.value === '') {
        this.ui.friendsList.list.append(e.target.parentElement);
      } else {
        e.target.parentElement.remove();
      }
      this.refreshStorage(false, e.target.parentElement.dataset.id);
    }
  }

  refreshStorage(isMove, id) {
    const lists = JSON.parse(this.storage.lists);
    if (isMove === true) {
      lists.filterList[id] = lists.friendsList[id];
      delete lists.friendsList[id];
    } else {
      lists.friendsList[id] = lists.filterList[id];
      delete lists.filterList[id];
    }

    this.storage.lists = JSON.stringify(lists);
  }

  makeDnD() {
    let currentDrag;

    document.body.addEventListener('dragstart', (e) => {
      const currentList = this.getCurrentList(e.target);

      if (currentList) {
        currentDrag = {
          startList: currentList,
          node: e.target,
        };
        e.dataTransfer.setData('text/html', 'dragstart');
      }
    });

    document.body.addEventListener('dragover', (e) => {
      const currentList = this.getCurrentList(e.target);
      if (currentList) {
        e.preventDefault();
      }
    });

    document.body.addEventListener('drop', (e) => {
      e.preventDefault();
      const currentList = this.getCurrentList(e.target);
      if (currentDrag) {
        if (currentList && currentDrag.startList !== currentList) {
          const moveButton = currentDrag.node.querySelector('.friend__button');

          if (currentList.dataset.role === 'filterList') {
            moveButton.dataset.role = 'friend-remove';
            moveButton.classList.add('friend__button--remove');
            if (this.ui.filterList.filter.value === '') {
              currentList.append(currentDrag.node);
            } else {
              currentDrag.node.remove();
            }
            this.refreshStorage(true, currentDrag.node.dataset.id);
          } else {
            moveButton.dataset.role = 'friend-move';
            moveButton.classList.remove('friend__button--remove');
            if (this.ui.friendsList.filter.value === '') {
              currentList.append(currentDrag.node);
            } else {
              currentDrag.node.remove();
            }
            this.refreshStorage(false, currentDrag.node.dataset.id);
          }

          currentDrag = null;
        }
      }
    });
  }

  getCurrentList(target) {
    return target.closest('.list__array');
  }

  isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();

    return full.indexOf(chunk) < 0 ? false : true;
  }
}
