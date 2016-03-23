var yargs = require('yargs');

var flerp = '';

process.stderr.on('readable', function(buffer){
   var part = buffer.read().toString();
   string += part;
   console.log('stream data ' + part); 
});

yargs
    .usage('Usage: /lunchorder <command> [options]')
    .command('count', 'Count the lines in a file')
    .demand(1)
    .example('$0 count -f foo.js', 'count the lines in the given file')
    .demand('f')
    .alias('f', 'file')
    .nargs('f', 1)
    .describe('f', 'Load a file')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2015')
    .parse(flerp);