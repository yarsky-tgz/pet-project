import EventEmitter from 'events';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import * as stream from 'stream';

class ReadlineInterface extends EventEmitter {
  constructor(input: ReadlineInterface) {
    super();
    let brokenString: string;
    input.on('data', (chunk: string) => {
      if (chunk.indexOf('\n') !== -1) {
        chunk.split('\n').forEach((element, index, array) => {
          if (index === array.length - 1) {
            brokenString = element;
          } else if (index === 0) {
            this.emit('line', brokenString + element);
          } else {
            this.emit('line', element);
          }
        });
      } else {
        brokenString += chunk;
      }
    })

      .on('end', () => {
        this.emit('line', brokenString);
        this.emit('close');
      });
  }
}

const readline = {
  createInterface({ input }:{[key:string]: ReadlineInterface}) {
    return new ReadlineInterface(input);
  },
};

(async () => {
  const data = await fetch('http://lib.ru/RUFANT/')
    .then((response) => {
      if (response && response.body) return response.body.pipe(iconv.decodeStream('koi8-r'));
    });
  const regular = /(?<=<small><b>)(?<type>.*?)(?=<\/b>).*?(?<=<\/small><\/tt> <A HREF=)(?<uri>.*?)(?=\/>).*?(?<=\/><b>)(?<name>.*?)(?=<\/b><\/A>)/;
  const autors: object[] = [];
  const rl = readline.createInterface({ input: data as stream });
  rl.on('line', (input: string) => {
    type ExecRegex = RegExpExecArray & { groups: {} };
    const result = regular.exec(input) as ExecRegex;
    if (result) {
      const { name, type, uri } = result.groups;
      const newObject = { name, type, uri };
      autors.push(newObject);
    }
  })
    .on('close', () => console.log(autors));
})();
