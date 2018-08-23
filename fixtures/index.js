import { ONode, parseONodes, toString, valueOf } from './onode';
import ONodeAdapter from './onode-adapter';

const getSourceTree = () =>
  parseONodes({
    data: { level: 0 },
    first: {
      data: { level: 1 },
      first: {
        data: { level: 2 },
        first: {
          data: { level: 3 },
          first: { data: { level: 4 } },
          second: { data: { level: 4 } },
          third: { data: { level: 4 } },
          fourth: { data: { level: 4 } },
          fifth: { data: { level: 4 } },
          sixth: { data: { level: 4 } },
        },
        second: { data: { level: 3 } },
        third: [
          { data: { index: 0, level: 3 } },
          { data: { index: 1, level: 3 } },
          { data: { index: 2, level: 3 } },
          { data: { index: 3, level: 3 } },
        ],
        fourth: { data: { level: 3 } },
        uniqueName: { data: { uniqueParam: '123-456', level: 3 } },
        fifth: { data: { level: 3 } },
        sixth: { data: { level: 3 } },
      },
      second: { data: { level: 2 } },
      third: { data: { level: 2 } },
      fourth: { data: { level: 2 } },
      fifth: { data: { level: 2 } },
      sixth: { data: { level: 2 } },
    },
    second: { data: { level: 1 } },
    third: { data: { level: 1 } },
    fourth: { data: { level: 1 } },
    fifth: { data: { level: 1 } },
    sixth: { data: { level: 1 } },
  });

export { ONode, ONodeAdapter, getSourceTree, toString, valueOf };
