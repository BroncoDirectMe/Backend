import csv
import json

def parse_course(course_str: str):
    units = str(course_str[-3:]).strip().replace(')', '').replace('(', '')
        
    parts = str(course_str[:-3]).split(' - ')
    courseID = parts[0]
    name = str(' - '.join(parts[1:])).strip()
        
    return {"id": courseID, "name": name, "units": units}

def parse_data(school_year: str):

    # Read the requirements file to get the majors and their requirements
    major_requirements = {}
    with open(f'./parser/CourseCurriculum/{school_year}_Requirements.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            major, requirements = row
            major_requirements[major.split(': ')[0]] = {"requirements": requirements}

    with open(f'./parser/CourseCurriculum/{school_year}_Programs.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            major, required, electives = row
            
            required_courses = [parse_course(course)["id"] for course in required.split("),")]
            electives_courses = [parse_course(course)["id"] for course in electives.split("),")]
            major_requirements[major.split(': ')[0]] = {
                "requirements": major_requirements[major.split(': ')[0]]["requirements"],
                "required": required_courses,
                "electives": electives_courses,
                "units": major.split(': ')[1],
                "name": major.split(': ')[0],
            }

    # Export dictionaries to JSON
    with open(f'./parser/parsed/majors_{school_year}.json', 'w') as f:
        json.dump(major_requirements, f, indent=2)

    courses_info = {}

    with open(f'./parser/CourseCurriculum/{school_year}_Courses.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row
        for row in reader:
            course, prereq, coreq = row
            course = parse_course(course)
            courses_info[course["id"]] = {
                "id": course["id"],
                "name": course['name'],
                "units": course["units"],
                "prerequisites": prereq,
                "corequisites": coreq
            }
            
    # Export dictionaries to JSON
    with open(f'./parser/parsed/courses_{school_year}.json', 'w') as f:
        json.dump(courses_info, f, indent=2)


available_years = ['2019-2020', '2020-2021', '2021-2022', '2022-2023', '2023-2024']

for school_year in available_years:
    parse_data(school_year)