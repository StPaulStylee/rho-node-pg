$(function(){
  getBooks();
  $('#book-form').on('submit', addBook);

  $('#book-list').on('click', '.save', updateBook);
});

function getBooks() {
  $.ajax({
    type: 'GET',
    url: '/books',
    success: displayBooks
  });
}

function displayBooks (response) {
  console.log(response);
  var $list = $('#book-list');
  $list.empty();
  response.forEach(function(book){
    var $li = $('<li></li>');
    var $form = $('<form></form>');
    $form.append('<input type="text" name="title" value="' + book.title + '"/>');
    $form.append('<input type="text" name="author" value="' + book.author + '"/>');
    var date = new Date(book.published);
    $form.append('<input type="date" name="published" value="' + date.toISOString().slice(0,10) + '" />');
    $form.append('<input type="text" name="publisher" value="' + book.publisher + '"/>');
    $form.append('<input type="text" name="edition" value="' + book.edition + '"/>');
    var $button = $('<button class="save">Save!</button>');
    $button.data('id', book.id);
    $form.append($button);
    $li.append($form);
    $list.append($li);
  });
}

function addBook(event) {
  event.preventDefault();
  var bookData = $(this).serialize();
  $.ajax ({
    type: 'POST',
    url: '/books',
    data: bookData,
    success: getBooks
  });
  $(this).find('input').val('');
}

function updateBook(event) {
  // Anytime there is a button inside a form, even if it is not a type=submit, it will behave like a submit button. So we
  // need to call prevent default.
  event.preventDefault();
  var $button = $(this);
  var $form = $button.closest('form');
  var data = $form.serialize();
  $.ajax ({
    type: 'PUT',
    url: '/books/' + $button.data('id'),
    data: data,
    success: getBooks
  });
}
