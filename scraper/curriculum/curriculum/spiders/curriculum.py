# Ignore the bad variable names, just focus on what the comments explain about the scraper

import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
import re
class CurriculumScraper(CrawlSpider):
    name = "curriculum"
    start_urls = ["https://catalog.cpp.edu/content.php?catoid=65&navoid=5519"] # This is the start url, change this manually to the index of Academic Programs of the year you are interested in scraping

    rules = [
        Rule( 
            LinkExtractor(restrict_text=r'(?P<name>units)'), # This tells the scraper which links to click on, which are any links that have the word units in them
            callback="parse_page" # Calls the parse_page function below
            )
        ]
    def parse_page(self, response):
        # First part of the code is responsable for getting the programs name, required courses, and electives.
        # Second part of the code is responsable for getting the requirements for that program
        
        # First Part of code
        test = response.css('div.acalog-core') # Once again, ignore bad variable names. There's an explanation for what the variables do at the end of the first part
        test2 = test.css("div.acalog-core ul")
        pattern = r'>([^<]+)<\/a>' # Regex pattern for getting context between > and </a> tags, which helps get the name of the course
        majorCourses = test2[0].css('li.acalog-course span').getall() # Gets the required courses
        electiveCourses = [] 
        for i in range(1, len(test2)):
            electiveCourses.extend(test2[i].css('li.acalog-course span').getall()) # Gets the remaining courses that exclude the required courses, electives

        # These for loops use the regex pattern to remove all the non important text from the strings, and then replaces the "dirty" text with the cleaned text
        for index,course in enumerate(majorCourses):
            name = re.search(pattern, course).group(1)
            majorCourses[index] = name

        for index,course in enumerate(electiveCourses):
            name = re.search(pattern, course).group(1)
            electiveCourses[index] = name

        # test = response.css('div.acalog-core') This contains all instances of acalog-core found on the page
        # test2 = test.css("div.acalog-core ul") This gets further instances of acalog-core with ul and puts it in a list
        # li.acalog-course span gets any li tag with the class acalog-course, and then gets instances of span within those li.acalog-courses
        # test2[i].css('li.acalog-course span').getall() Returns the list of courses for that block as a list
        # test2[0] should be required courses, everything else is electives

        # Second Part of code
        # Ignore list that contains all the tags that we want to ignore, contains edge cases too
        ignoreList = {'Curriculum','General Education Requirements: 48 units', 'American Cultural Perspectives Requirement: 3 units','Interdisciplinary General Education: 21 units','Interdisciplinary General Education: 18 units', 'American Institutions: 6 units', 'Graduation Writing Test', 'Note(s):'}
        allNames =  response.css("div.acalog-core h2::text").extract() # Extracts all the h2 tags on the page into text
        selectNames = []
        # Handles edge case where sometimes the page has the h2 as curriculum and then has the actual names we need under it
        if len(allNames) == 1:
            if allNames[0] == 'Curriculum':
                allNames = response.css("div.acalog-core h3::text").extract() # Replaces allNames with tags in edge case

        for i in allNames: # Goes through the list of all the names we gathered
            name = i.replace("*","") # Removes any asteriks found, specifically for when "Note(s)" might be put as "Note(s)*" and such
            name = name.strip() # Removes whitespaces at the ends
            if name not in ignoreList: # Makes sure name isn't in the ignore list, then appends it to the selectNames list, which contains the names we want
                selectNames.append(name)

        yield{ # Returns 4 things, the major name, the required courses, the electives, and the requirements
            "Program Name" : response.css("h1 ::text").get(),
            "Required Courses": majorCourses,
            "Electives" : electiveCourses,
            "Requirements": selectNames
        }
