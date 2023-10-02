"""
Make sure you have scrapy installed
1. Change start url to the Index of Academic Programs page of the year you want and save the file. the one included is for the 2023-2024 year
2. Open a terminal in the folder where curriculum.py is in
3. In the terminal put scrapy crawl course -O "put file name here".csv
4. Let it run till it finishes, there should be a csv file in the same folder.
Now repeat that for the other 4 years, should just be as easy as replacing the starting url. 
"""

import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
import re
class CourseScraper(CrawlSpider):
    name = "course"
    start_urls = ["https://catalog.cpp.edu/content.php?catoid=65&navoid=5519"] # Change this manually to the index of Academic Programs page of the year you are interested in scraping

    rules = [
        Rule(
            LinkExtractor(restrict_text=r'(?P<name>units)'),
            callback="parse_page"
        )
    ]

    def parse_page(self, response):
        core_divs = response.css('div.acalog-core')
        core_lists = core_divs.css("ul")
        majorCourses = core_lists[0].css('li.acalog-course span').getall()
        electiveCourses = [course for sublist in core_lists[1:] for course in sublist.css('li.acalog-course span').getall()]

        pattern = re.compile(r'showCourse\(\'(\d+)\', \'(\d+)\'')
        
        for course in majorCourses + electiveCourses:
            match = pattern.search(course)
            if match:
                catoid, coid = match.groups()
                new_link = f"https://catalog.cpp.edu/preview_course.php?catoid={catoid}&coid={coid}"
                yield response.follow(new_link, self.further_parse)

    def further_parse(self, response):
        course_name = response.css('#course_preview_title::text').get(default='').strip()

        def extract_text(starting_phrase):
            # Locate the <strong> element containing the starting phrase
            following_nodes = response.xpath(
                f'//strong[contains(text(), "{starting_phrase}")]/following-sibling::node()'
            )
            text_chunks = []
            for node in following_nodes:
                node_string = node.extract()
                if '<br>' in node_string:
                    break  # Stop collecting text once a <br> element is encountered
                elif '<a' in node_string:
                    # Extract text content from <a> elements
                    link_text = re.search(r'>([^<]+)<', node_string)
                    if link_text:
                        text_chunks.append(link_text.group(1).strip())
                elif '<span' not in node_string:
                    # Collect text from text nodes while ignoring <span> elements
                    text_chunks.append(node_string.strip())
            # Join all collected text chunks into a single string, replacing multiple spaces with a single space
            text = ' '.join(text_chunks)
            text = re.sub(r'\s+', ' ', text)
            return text.strip()


        prerequisites_text = extract_text("Prerequisite(s):")
        corequisites_text = extract_text("Corequisite(s):")

        yield {
            'course_name': course_name,
            'prerequisites': prerequisites_text,
            'corequisites': corequisites_text,
        }