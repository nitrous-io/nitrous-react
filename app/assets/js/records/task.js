import { Record } from 'immutable';

export default class Task extends Record({
  id: null,
  description: null,
  progress: null // % progress, 100 = done, -1 = failed
}) {}
