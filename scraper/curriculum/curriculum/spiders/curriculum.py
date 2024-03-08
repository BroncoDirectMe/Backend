import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
import re
class CurriculumScraper(CrawlSpider):
    name = "curriculum"
    start_urls = ["https://catalog.cpp.edu/content.php?catoid=65&navoid=5519"] 

    rules = [
        Rule( 
            LinkExtractor(restrict_text=r'(?P<name>units)'), 
            callback="parse_page" 
            )
        ]
    def parse_page(self, response):
        test = response.css('div.acalog-core') 
        test2 = test.css("div.acalog-core ul")
        pattern = r'>([^<]+)<\/a>' 
        majorCourses = test2[0].css('li.acalog-course span').getall()
        electiveCourses = [] 
        for i in range(1, len(test2)):
            electiveCourses.extend(test2[i].css('li.acalog-course span').getall())

        for index,course in enumerate(majorCourses):
            name = re.search(pattern, course).group(1)
            majorCourses[index] = name

        for index,course in enumerate(electiveCourses):
            name = re.search(pattern, course).group(1)
            electiveCourses[index] = name
            
        ignoreList = {'Curriculum','General Education Requirements: 48 units', 'American Cultural Perspectives Requirement: 3 units','Interdisciplinary General Education: 21 units','Interdisciplinary General Education: 18 units', 'American Institutions: 6 units', 'Graduation Writing Test', 'Note(s):'}
        allNames =  response.css("div.acalog-core h2::text").extract() 
        selectNames = []
        if len(allNames) == 1:
            if allNames[0] == 'Curriculum':
                allNames = response.css("div.acalog-core h3::text").extract() 

        for i in allNames:
            name = i.replace("*","") 
            name = name.strip() 
            if name not in ignoreList: 
                selectNames.append(name)

        yield{
            "Program Name" : response.css("h1 ::text").get(),
            "Required Courses": majorCourses,
            "Electives" : electiveCourses,
            "Requirements": selectNames
        }
