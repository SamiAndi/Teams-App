if (!db.hasTable('teams')) db.setTable('teams', 'code,name,score');

$(document).ready(function() {

    $('#eye').click(function() {
        $('#panel').toggleClass('hide');
        'eye'.save($('#panel').hasClass('hide'));
    });
    if ('eye'.save()) $('#eye').click();

    $('#form-add').submit(function(e) {
        e.preventDefault();
        let code = $(this).find('.code').val();
        let name = $(this).find('.name').val();
        db.insertInto(`${code},${name},0`, 'teams');
    });

    $('#form-remove').submit(function(e) {
        e.preventDefault();
        let code = $(this).find('.code').val();
        db.deletefromWhere(`teams`, `row.code==${code}`);
    });

    $('#form-score').submit(function(e) {
        e.preventDefault();
        let code = $(this).find('.code').val();
        let score = parseFloat($(this).find('.score').val());
        let old = db.selectFromWhere('score', 'teams', `row.code==${code}`)[0]['score'];
        plus ? score += old : score = old - score;
        db.updateSetWhere(`teams`, `row.score=${score}`, `row.code==${code}`);
    });

    $('#form-new').submit(function(e) {
        e.preventDefault();
        let code = $(this).find('.code').val();
        let score = parseFloat($(this).find('.score').val());
        db.updateSetWhere(`teams`, `row.score=${score}`, `row.code==${code}`);
    });

});