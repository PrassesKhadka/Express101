const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");


// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});
 
// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance: bookInstance,
  });
});


// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});


// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];


// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {  
  res.render("bookinstance_delete")
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookinstance=await BookInstance.findById(req.params.id).populate('book').exec()
  await BookInstance.findByIdAndRemove(req.params.id)
  res.redirect(`/catalog/book/${bookinstance.book.id}/delete`)
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [all_books,bookinstance]=await Promise.all([
  Book.find().exec(),
  BookInstance.findById(req.params.id).populate("book").exec()])

  res.render("bookinstance_form",{
    title:"Bookinstance Update",
    book_list:all_books,
    selected_book:bookinstance.book.id,
    bookinstance:bookinstance
  })
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post =[ 
  // Validating and sanitizing the data coming from form 
  body("book","Book must be specified").trim().isLength({min:1}).escape(),
  body("imprint","Imprint must be specified").trim().isLength({min:1}).escape(),
  body("due_back","Invalid date")
  .optional({values:"falsy"})
  .isISO8601()
  .toDate(),
  body("status").escape(),
    
  asyncHandler(async (req, res, next) => {
    const errors=validationResult(req)
    const bookinstance=new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status:req.body.status,
      due_back:req.body.due_back,
      _id:req.params.id,
    })

    if(!errors.isEmpty()){
      const all_books=await BookInstance.find({},"title").exec()
      res.render("bookinstance_form",{
        title:"Bookinstance Update",
        book_list:all_books,
        selected_book:req.body.book._id,
        errors:errors.array(),
        bookinstance:bookinstance,
      });
      return;
    }else{
      await BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{})
      res.redirect(bookinstance.url)
    }
  })
];




