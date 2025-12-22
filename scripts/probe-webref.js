import * as css from '@webref/css';

async function test() {
    const data = await css.listAll();
    const keys = Object.keys(data);
    console.log('Count:', keys.length);
    console.log('First key:', keys[0]);
    console.log('First item:', JSON.stringify(data[keys[0]], null, 2));
}

test();
