import json
import urllib.request
import xmltodict
import time

# Use doi.org API to look up paper information

class doi_lookup:
    def __init__(self):
        self.doicache = {}
        self.link_overrides = {}


    def print():
        for doi in self.doicache.keys():
            p = self.doicache[doi]
            if p["type"]=="link":
                print(doi)
            else:
                print(self.doicache[doi]["title"]+" http://doi.org/"+doi)

    # elements:
    # Label, Type, Tags, Description, References, DOI, UN SDG, Variables
    # Tags = "climate variable"
    def doi2info(self,doi,type):
        if doi in self.doicache:
            return self.doicache[doi]
        
        opener = urllib.request.build_opener()
        opener.addheaders = [('Accept', 'application/vnd.crossref.unixsd+xml')]
        while True:
            print("reading doi.org: "+doi)
            r = opener.open('http://dx.doi.org/'+doi)
            d = xmltodict.parse(r.read())

            print(type)
            if type=="Journal Article":
                self.read_article(doi,d)
            else:
                self.read_book(doi,d)

            return self.doicache[doi]


    def read_book(self,doi,d):
        #print (json.dumps(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"], indent=4))

        book = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["book"]
        print (json.dumps(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"], indent=4))

        title = book["book_metadata"]["titles"]["title"]

        authors = ""
        if "content_item" in book:
            for contributor in book["content_item"]["contributors"]["person_name"]:
                authors+=(contributor["given_name"]+" "+contributor["surname"]+", ")
        else:
            contributor= book["book_metadata"]["contributors"]["person_name"]
            authors+=(contributor["given_name"]+" "+contributor["surname"]+", ")

        
        date=book["book_metadata"]["publication_date"]["year"]
                
        journal_title = ""

        issue=""

        self.doicache[doi]={
            "type": "article",
            "doi": doi,
            "title": title,
            "authors": authors,
            "date": date,
            "journal": journal_title,
            "issue": issue,
        }

    def read_article(self,doi,d):
        journal = d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]
        article = journal["journal_article"]

        #print(d["crossref_result"]["query_result"]["body"]["query"]["doi_record"]["crossref"]["journal"]["journal_article"])
        title = article["titles"]["title"]
        
        authors = ""
        #print(article["contributors"]["person_name"])
        alist = article["contributors"]["person_name"]
        if isinstance(alist, list):
            for contributor in alist:
                if contributor["@contributor_role"]=="author":
                    authors+=(contributor["given_name"]+" "+contributor["surname"]+", ")
        else:
            authors+=(alist["given_name"]+" "+alist["surname"]+", ")
                
        date = ""
        if isinstance(article["publication_date"], list):
            for d in article["publication_date"]:
                if d["@media_type"]=="print":
                    date = d["year"]
        else:
            date=article["publication_date"]["year"]
                
        journal_title = journal["journal_metadata"]["full_title"]
        #print(journal["journal_issue"])

        issue=""
        if "journal_issue" in journal:
            if "issue" in journal["journal_issue"]:
                issue = journal["journal_issue"]["issue"]

        link = "http://doi.org/"+doi

        if doi in self.link_overrides:
            link = self.link_overrides[doi]
                    
        self.doicache[doi]={
            "type": "article",
            "doi": doi,
            "title": title,
            "authors": authors,
            "date": date,
            "journal": journal_title,
            "issue": issue,
        }

        
    def get_reference(self,doi):
        if doi in self.doicache:
            return self.doicache[doi]
        else:
            return "reference not found"
