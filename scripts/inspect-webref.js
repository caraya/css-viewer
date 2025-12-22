import * as css from '@webref/css';
console.log('listAll type:', typeof css.listAll);
css.listAll().then(data => {
    console.log('listAll keys:', Object.keys(data));
    // Check if values are objects that look like specs
    const firstKey = Object.keys(data)[0];
    console.log('First key:', firstKey);
    console.log('First value keys:', Object.keys(data[firstKey]));
});
