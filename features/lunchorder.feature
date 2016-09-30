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
        Then I should see the order for Steve

    Examples:
        |restaurant |
        |lillaoskar |
        |newyork    | 
        
    Scenario: Order lunch at a restaurant
        When I order lunch at lillaoskar
        Then I should get the correct text in the response

    Scenario: Order lunch without parameters 
        When I order lunch without parameters 
        Then I should get a warning about missing parameters
    
    Scenario: Order lunch twice
        When I order lunch twice at lillaoskar
        Then I should see the order for Steve
        
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

    Scenario: Order with just the r and m flag
        When I order with just the r and m flag
        Then I should see the order for Steve 

    Scenario: Repeat last order
        Given I have an order at lillaoskar
        When I order lunch with the lo flag
        Then I should see the order for Steve

    Scenario: Repeat last order when last order does not exist
        When I order lunch with the lo flag
        Then I should see the warning text about the lo flag 

    Scenario: Repeat last order more than once
        Given I have an order at lillaoskar
        When I order lunch with the lo flag
        And I order lunch with the lo flag
        Then I should see the order for Steve

    Scenario: Getorder -a with no orders
        Given there are no orders
        When I get all orders
        Then I should see the warning text

    Scenario: Order for another user
        When I order lunch for someone else
        Then I should see the order for Lucy

    Scenario: Order twice and change restaurant
        When I order lunch twice at different restaurants
        Then I should see the order for Steve
