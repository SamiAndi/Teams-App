db = {
    co: [], // cols backup
    nt: function(name) { // name to table name
        return `db.table=${name}`;
    },
    ss: function(name, table) { // set save
        localStorage[db.nt(name)] = JSON.stringify(table);
    },
    gs: function(name) { // get save (by name or table)
        if (typeof name === 'string') return JSON.parse(localStorage[db.nt(name)]);
        return name;
    },
    li: function(name, id) { // last id (-1 returns name)
        name = `db.table.li=${name}`;
        if (id === undefined) return parseFloat(localStorage[name]);
        if (id < 0) return name;
        localStorage[name] = id;
    },
    to: function(table) { // table to objs
        table = db.gs(table);
        db.co = table.shift();
        table.forEach((row, index) => {
            let obj = {};
            db.co.forEach((col, colIndex) => obj[col] = row[colIndex]);
            table[index] = obj;
        });
        return table;
    },
    ot: function(objs) { // objs to table
        objs.forEach((obj, index) => {
            let row = [];
            Object.keys(obj).forEach(key => row.push(obj[key]));
            objs[index] = row;
        });
        return [db.co].concat(objs);
    },
    or: function(name, order) { // order
        order = order.split(' ').map(i => i.trim());
        let table = db.gs(name);
        let cols = table.shift();
        let by = cols.indexOf(order.shift());
        table.sort((a, b) => {
            a = a[by], b = b[by];
            if (isNaN(a)) return isNaN(b) ? a.localeCompare(b) : 1;
            return isNaN(b) ? -1 : parseFloat(a) - parseFloat(b);
        });
        table.sort((a, b) => a[by] - b[by]);
        if (order.map(i => i.toLowerCase()).includes('desc')) table.reverse();
        return [cols].concat(table);
    },
    local: function(clear) {
        let list = [];
        Object.keys(localStorage).forEach(key => {
            if (!(key.includes(db.nt('')) || key.includes(db.li('', -1)))) list.push(key);
        });
        if (clear == 'clear') {
            list.forEach(key => localStorage.removeItem(key));
        } else {
            let local = {};
            list.forEach(key => local[key] = localStorage[key]);
            return local;
        }
    },
    hasTable: function(name) {
        return Boolean(localStorage[db.nt(name)]);
    },
    setTable: function(name, cols) {
        db.ss(name, [
            [...new Set(`id,${cols}`.split(',').filter(i => i).map(i => i.trim()))]
        ]);
        db.li(name, 0);
    },
    getTable: function(name) {
        console.table(db.gs(name));
    },
    removeTable: function(name) {
        localStorage.removeItem(db.nt(name));
        localStorage.removeItem(db.li(name, -1));
    },
    copyTable: function(oldName, newName) {
        db.ss(newName, db.gs(oldName));
        db.li(newName, db.li(oldName));
    },
    renameTable: function(oldName, newName) {
        db.copyTable(oldName, newName);
        db.removeTable(oldName);
    },
    listTable: function() {
        let list = [];
        Object.keys(localStorage).forEach(key => {
            if (key.includes(db.nt(''))) list.push(key.replace(db.nt(''), ''));
        });
        return list;
    },
    clearTable: function() {
        db.listTable().forEach(name => db.removeTable(name));
    },
    selectFrom: function(select, name) {
        let table = db.gs(name);
        if (select.trim() !== '*') {
            let keep = select.split(',').map(i => table[0].indexOf(i.trim()));
            table.forEach((row, index) => {
                table[index] = table[index].filter((e, i) => keep.includes(i));
            });
        }
        return db.to(table);
    },
    selectFromWhere: function(select, name, where) {
        let objs = db.to(db.gs(name));
        let keep = [];
        objs.forEach((row, index) => eval(where) && keep.push(index));
        return db.selectFrom(select, db.ot(objs.filter((e, i) => keep.includes(i))));
    },
    selectFromOrder: function(select, name, order) {
        return db.selectFrom(select, db.or(db.gs(name), order));
    },
    selectFromWhereOrder: function(select, name, where, order) {
        return db.selectFromWhere(select, db.or(db.gs(name), order), where);
    },
    insertInto: function(values, name) {
        let table = db.gs(name);
        let insert = values.split(',').map(i => i.trim());
        if (table[0].length == insert.length + 1) {
            insert.forEach((value, index) => {
                if (!isNaN(value)) insert[index] = parseFloat(value);
            });
            db.li(name, db.li(name) + 1);
            db.ss(name, db.gs(name).concat([
                [db.li(name)].concat(insert)
            ]));
        } else {
            console.warn("Number of table columns isn't equal to insertInto values");
        }
    },
    updateSetWhere: function(name, set, where) {
        let objs = db.to(db.gs(name));
        let idUp = false;
        objs.forEach(row => {
            if (eval(where)) {
                let id = row.id;
                eval(set);
                if (row.id !== id) row.id = id, idUp = true;
            }
        });
        if (idUp) console.warn("You can't change row.id");
        db.ss(name, db.ot(objs));
    },
    updateSet: function(name, set) {
        db.updateSetWhere(name, set, 'true');
    },
    deletefromWhere: function(name, where) {
        let objs = db.to(db.gs(name));
        let keep = [];
        objs.forEach((row, index) => !(eval(where)) && keep.push(index));
        db.ss(name, db.ot(objs.filter((e, i) => keep.includes(i))));
    },
    resetTable: function(name) {
        db.deletefromWhere(name, 'true');
        db.li(name, 0);
    }
}