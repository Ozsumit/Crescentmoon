"use client";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Label } from "/components/ui/label";
import { Tab, Tabs, TabList, TabPanel } from "/components/ui/tabs";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://gutendex.com/books/${id}`);
        const data = await response.json();
        setBook(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>
                By{" "}
                {book.authors &&
                  book.authors.length > 0 &&
                  book.authors[0].name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{book.description}</p>
            </CardContent>
            <CardFooter>
              {book.formats && book.formats["text/html"] && (
                <Button
                  variant="link"
                  href={book.formats["text/html"]}
                  target="_blank"
                >
                  Read Online
                </Button>
              )}
              {book.formats && book.formats["application/pdf"] && (
                <Button
                  variant="link"
                  href={book.formats["application/pdf"]}
                  target="_blank"
                >
                  Download PDF
                </Button>
              )}
              {book.formats && book.formats["application/epub+zip"] && (
                <Button
                  variant="link"
                  href={book.formats["application/epub+zip"]}
                  target="_blank"
                >
                  Download EPUB
                </Button>
              )}
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Label>Authors:</Label>
                  <p>
                    {book.authors &&
                      book.authors.length > 0 &&
                      book.authors.map((author) => author.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Subjects:</Label>
                  <p>{book.subjects && book.subjects.join(", ")}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Bookshelves:</Label>
                  <p>{book.bookshelves && book.bookshelves.join(", ")}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Copyright:</Label>
                  <p>{book.copyright}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Download Count:</Label>
                  <p>{book.download_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Online Reader</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs>
                <TabList>
                  <Tab>Text</Tab>
                  <Tab>HTML</Tab>
                </TabList>
                <TabPanel>
                  {book.formats && book.formats["text/plain"] && (
                    <iframe
                      src={book.formats["text/plain"]}
                      frameBorder="0"
                      style={{ border: "none" }}
                      height="500"
                    ></iframe>
                  )}
                </TabPanel>
                <TabPanel>
                  {book.formats && book.formats["text/html"] && (
                    <iframe
                      src={book.formats["text/html"]}
                      frameBorder="0"
                      width="100%"
                      height="500"
                    ></iframe>
                  )}
                </TabPanel>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BookDetails;
