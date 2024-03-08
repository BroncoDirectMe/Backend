
BOT_NAME = "curriculum"

SPIDER_MODULES = ["curriculum.spiders"]
NEWSPIDER_MODULE = "curriculum.spiders"

ROBOTSTXT_OBEY = True

REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
