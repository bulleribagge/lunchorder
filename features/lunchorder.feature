Feature: Order lunch
    As a fellow Bamborian
    I want to be able to order food
    So that my belly is comfortably full

    Scenario: Order lunch at non existing restaurant
        When I order lunch at flerpymcderpy
        Then I should get a list of all the restaurants

    Scenario: Order lunch without specifying restaurant
        When I order lunch without specifying restaurant
        Then I should get an error message and a list of all the restaurants

    Scenario Outline: Order lunch at a restaurant
        When I order lunch at <restaurant>
        Then I should see my order

    Examples:
        |restaurant |
        |lillaoskar |
        |newyork    |
        
    Scenario: Order lunch without parameters at restaurant
        When I order lunch without parameters at lillaoskar
        Then I should get default values
    
    Scenario: Order lunch twice
        When I order lunch twice at lillaoskar
        Then I should see my order
        
    Scenario: Get all orders
        When many people have ordered at lillaoskar
        Then I should see all orders
    
    Scenario: Cancel order
        When I order lunch at lillaoskar
        And I cancel it
        Then I should not see my order
        
    Scenario: Cancel order when I've made two orders
        When I order lunch twice at lillaoskar
        And I cancel it
        Then I should not see my order
        
    Scenario: Order with invalid slack token
        Given I have an invalid slack token
        When I order lunch at lillaoskar
        Then I should get an HTTP error 403 back
        
    Scenario: Use invalid command
        When I use an invalid command
        Then I should see the help text