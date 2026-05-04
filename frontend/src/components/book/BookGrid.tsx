import type { Book } from "../../types/index"
import BookCard from "./BookCard"

const BookGrid = ({books}: {books: Book[]}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
            <BookCard key={book.id} book={book} />
        ))}
    </div>
  )
}

export default BookGrid