package main

import (
	"database/sql"
	"flag"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"html/template"
	"log"
	"net/http"
	"os"
)

type dbItem struct {
	ID          int
	Label       string
	Brand       string
	Price       float64
	OldPrice    float64
	ImgUrl      string
	ItemUrl     string
	Status      string
	FirstIngest string
	LastUpdated string
}

var db *sql.DB
var tmpl *template.Template

func main() {
	initDB()         // Initialize the database
	initTemplates()  // Initialize the templates
	defer db.Close() // Close the database when done

	port := flag.Int("p", 8080, "Port where viewer will be run on localhost")
	flag.Parse()

	http.HandleFunc("/", bishoujoPage)
	http.HandleFunc("/advanced", advancedPage)
	http.HandleFunc("/fumos", fumoPage)

	log.Printf("Server started at http://localhost:%d\n", *port)
	addr := fmt.Sprintf(":%d", *port)
	http.ListenAndServe(addr, nil)
}
func initDB() {
	var err error
	db, err = sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/saya-db")

	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
}

func initTemplates() {
	tmplBytes, err := os.ReadFile("template.html")
	if err != nil {
		log.Fatalf("Error loading template: %v", err)
	}
	tmpl, err = template.New("home").Parse(string(tmplBytes))
	if err != nil {
		log.Fatalf("Error parsing template: %v", err)
	}
}
func bishoujoPage(w http.ResponseWriter, r *http.Request) {
	// Query to get data from the database
	rows, err := db.Query("SELECT id AS ID, name AS Label, brand AS Brand, price AS Price, old_price AS OldPrice, image_url AS ImgUrl, detail_url AS ItemUrl, status AS Status, first_ingest AS FirstIngest, last_updated AS LastUpdated FROM figures ORDER BY first_ingest DESC, id DESC")
	if err != nil {
		http.Error(w, "Error retrieving data", http.StatusInternalServerError)
		log.Printf("Database query error: %v", err)
		return
	}
	defer rows.Close()

	// Slice to hold all product entries
	var figures []dbItem

	// Loop through the rows and scan data
	for rows.Next() {
		var p dbItem
		if err := rows.Scan(&p.ID, &p.Label, &p.Brand, &p.Price, &p.OldPrice, &p.ImgUrl, &p.ItemUrl, &p.Status, &p.FirstIngest, &p.LastUpdated); err != nil {
			log.Printf("Error scanning row: %v", err)
			return
		}
		figures = append(figures, p)
	}

	// Render the template with the product data
	if err := tmpl.Execute(w, figures); err != nil {
		log.Printf("Error executing template: %v", err)
	}
}
func fumoPage(w http.ResponseWriter, r *http.Request) {
	// Query to get data from the database
	rows, err := db.Query("SELECT id AS ID, name AS Label, brand AS Brand, price AS Price, old_price AS OldPrice, image_url AS ImgUrl, detail_url AS ItemUrl, status AS Status, first_ingest AS FirstIngest, last_updated AS LastUpdated FROM fumos ORDER BY first_ingest DESC, id DESC")
	if err != nil {

		http.Error(w, "Error retrieving data", http.StatusInternalServerError)
		log.Printf("Database query error: %v", err)
		return
	}
	defer rows.Close()

	// Slice to hold all product entries
	var figures []dbItem

	// Loop through the rows and scan data
	for rows.Next() {

		var p dbItem

		if err := rows.Scan(&p.ID, &p.Label, &p.Brand, &p.Price, &p.OldPrice, &p.ImgUrl, &p.ItemUrl, &p.Status, &p.FirstIngest, &p.LastUpdated); err != nil {
			log.Printf("Error scanning row: %v", err)
			return
		}
		figures = append(figures, p)
	}

	// Render the template with the product data
	if err := tmpl.Execute(w, figures); err != nil {
		log.Printf("Error executing template: %v", err)
	}
}
func advancedPage(w http.ResponseWriter, r *http.Request) {
	// Query to get data from the database
	rows, err := db.Query("SELECT id AS ID, name AS Label, brand AS Brand, price AS Price, old_price AS OldPrice, image_url AS ImgUrl, detail_url AS ItemUrl, status AS Status, first_ingest AS FirstIngest, last_updated AS LastUpdated FROM afigures ORDER BY first_ingest DESC, id DESC")
	if err != nil {
		http.Error(w, "Error retrieving data", http.StatusInternalServerError)
		log.Printf("Database query error: %v", err)
		return
	}
	defer rows.Close()

	// Slice to hold all product entries
	var figures []dbItem

	// Loop through the rows and scan data
	for rows.Next() {
		var p dbItem
		if err := rows.Scan(&p.ID, &p.Label, &p.Brand, &p.Price, &p.OldPrice, &p.ImgUrl, &p.ItemUrl, &p.Status, &p.FirstIngest, &p.LastUpdated); err != nil {
			log.Printf("Error scanning row: %v", err)
			return
		}
		figures = append(figures, p)
	}

	// Render the template with the product data

	if err := tmpl.Execute(w, figures); err != nil {
		log.Printf("Error executing template: %v", err)
	}
}
