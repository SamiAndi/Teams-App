function update() {
    let rank = 0;
    $('#rows').html('');
    db.selectFromOrder('*', 'teams', 'score desc').forEach(row => {
        rank++;
        $('#rows').append(`<div class="row"><div class="col-2">${rank}</div><div class="col-2 code">${row.code}</div><div class="col-${nameCol}">${row.name}</div><div class="col-2">${row.score}</div></div>`);
    });
    setTimeout(update, 2500);
}

$(document).ready(function() {
    nameCol = 6;
    if (window == window.top) {
        nameCol = 8;
        $('.col-6').attr('class', 'col-8');
        $('head').append('<style>.code{display:none}</style>');
    }
    update();
});