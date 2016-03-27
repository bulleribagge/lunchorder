Feature: Order lunch
    As a fellow Bamborian
    I want to be able to order food
    So that my belly is comfortably full
    
    Scenario: Order lunch
        When I order lunch
        Then I should see my order
        
    Scenario: Order lunch without parameters
        When I order lunch without parameters
        Then I should get default values
        
    Scenario: Order lunch twice
        When I order lunch twice
        Then I should see my order
        
    Scenario: Get all orders
        When many people have ordered
        Then I should see all orders
        
    Scenario: Cancel order
        When I order lunch
        And I cancel it
        Then I should not see my order
        
    Scenario: Cancel order when I've made two orders
        When I order lunch twice
        And I cancel it
        Then I should not see my order