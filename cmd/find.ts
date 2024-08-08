import { command, run, string, positional, number } from 'cmd-ts';

const app = command({
  name: 'find-by-JAN',
  args: {
    janArg: positional({ type: number, displayName: 'JAN code' }),
  },
  handler: ({ janArg, }) => {
    console.log({ janArg });

  },
});

const main = () => {
  run(app, process.argv.slice(2));
  console.log('It works!');

};

main();