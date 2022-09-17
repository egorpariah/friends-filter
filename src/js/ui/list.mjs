import renderFriends from '../../templates/friends.hbs';

export default class List {
  constructor(list, filter, onInput) {
    this.list = list;
    this.filter = filter;
    this.onInput = onInput;

    this.filter.addEventListener('input', () => {
      const params = this.onInput(this.list, this.filter.value);
      this.fill(...params);
    });
  }

  fill(items, buttonClass, buttonRole) {
    this.list.innerHTML = renderFriends({
      list: items,
      buttonClass: buttonClass,
      buttonRole: buttonRole,
    });
  }
}
