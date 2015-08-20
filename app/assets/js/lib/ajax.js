import $ from 'jquery';

export default function ajax() {
  return Promise.resolve($.ajax(...arguments));
}
