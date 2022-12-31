# selenium
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

# extra
import time, json

# bronco 411 url
URL = "https://apps.cpp.edu/bronco411/search/"

# set for professors
professors = set()

# TODO
# seperate Professors by last name first name
# export professors set into a json file
# look into search 2 letters to avoid missing professors

# UNTESTED 
# def convert_professors(professors: set) -> None:
#     prof = {'professors': list(professors)}
#     json_object = json.dumps(prof, indent=4)
#     with open("professors.json", "w") as FILE:
#         FILE.write(json_object)

def format_name(name: str) -> str:
    """This function takes in a professor name and formats the return

    Args:
        name (str): professor name

    Returns:
        str: formatted professor name
    """
    return name.split('\n')[0]

def search(driver, letter: str) -> None:
    """This function runs the search for Bronco 411

    Args:
        driver (_type_): driver object
        letter (str): search input
    """
    # letter
    time.sleep(1)
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_prsn_name"))).send_keys(letter)
    
    # buttons
    time.sleep(1) 
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_CK_STAFF"))).click() # staff
    
    time.sleep(1)
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_CK_OTHERS"))).click() # other
    
    # submit
    time.sleep(7) 
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "ctl00_ContentPlaceHolder1_PublicSearchButton"))).click()
    
    # get professor names, format the name, and add them to the set
    time.sleep(2)
    rows = driver.find_elements(By.XPATH, "//table[@id='ctl00_ContentPlaceHolder1_PeopleGV']/tbody/tr/td[1]")
    for name in rows:
        professors.add(format_name(name.text))
    
    # sleep between professor letter search
    time.sleep(2)

def main():
    # opens webdriver
    print("starting driver...\n")
    driver = webdriver.Chrome()

    # list of all letter (a-z)
    letters = []
    for i in range(97, 123):
        letters.append(chr(i))

    # iterates each letter in letters
    for letter in letters:   
        # navigates to bronco411
        driver.get(URL) 
        time.sleep(2)

        # search function
        print(f"starting search ({letter})...")
        try:
            search(driver, letter)
            print(f"{letter} successfully checked!\n")
        except:
            letters.append(letter)
            print(f"{letter} failed retrying later...\n")
    
    print(f"\n\nname scraping process complete!\ntotal professors: {len(professors)}\n{professors}")

if __name__ == '__main__':
    main()