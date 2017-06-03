# SigFig Dev Test #2 -- Flight Itinerary

This dev test was sent to me as a back-end test. However, to my knowledge, the position I would fullfill is that of a front-end developer. As such, I have treated this as more of a full-stack test, building both front-end and back-end components.

I chose to use Node.js with Express for my back-end, coupled with Jasmine.js for unit tests. The front-end is built in AngularJS v1.6.4 and Bootstrap CSS compiled from Sass.

The back-end listens for predefined API route calls, and serves the single-page AngularJS application for all other traffic. The front-end provides an interface for specifying a source and destination, with some typeahead suggestion functionality. The JSON data for suggestions was provided by [https://github.com/jbrooksuk/JSON-Airports].

I tried to build a seeder for test data, but had issues generating properly-spaced flight options that could be connected from one destination to another. In the end, I extended the mocked data to add some additional complexity. This is explained in more detail in the Jasmine tests, via the `/spec` directory.

To be completely honest, I am not very experience building unit tests. I did the best I could, and am not altogether certain that the API set is running as expected -- they seem to exectute extremely fast. I am more confident of the unit tests for the interface class that is invoked by the API handlers, however, after mocking some expected cases for use by the unit tests.

## Asymptotic Runtime and Memory Complexity

I think the implemented back-end solution runtime complexity is **O(n^n)**. I'm not entirely sure -- never had to implement a path-finding algorithm like this before, and not used to calculating the complexity for it. In short: for each given node from the starting point, it attempts to find all connecting nodes, and then sort in ascending order by departure time. This process repeats recursively until all options are exhausted. For any possible full paths discovered, each is then compared on the basis of final arrival time. I'm not sure how that type of procedural comparison is defined in Big O notation, but I don't believe it would really scale well.

I suppose the same guess applies to the memory complexity? Like I said, I've never done a path-finding algorithm like this, so anything beyond traditional loops and sorting is difficult for me to gauge.

## The Problem Definition:

### Itinerary Finder

Your task is to build a tool for the ticketing desk of an airline to find the best possible itinerary for
a customer at the desk who wants to reach a particular destination at the earliest possible time.
You may assume that the customer doesn’t care about price or the number of connecting
flights; they just want to land at their destination as soon as possible.

Your tool should take as input 1) a list of scheduled future flights, 2) the origin airport name, and 3) the destination airport name. It should produce an textual itinerary which gets the customer to
the destination as soon as possible. For example, you could ingest the flight data as JSON:

    [
        {
            "flightNumber": 117,
            "sourceAirport": "SFO",
            "destinationAirport": "OAK",
            "departureTime": "2017-01-25T22:17:05Z",
            "arrivalTime": "2017-01-25T22:21:00Z"
        },
        {
            "flightNumber": 451,
            "sourceAirport": "OAK",
            "destinationAirport": "IAD",
            "departureTime": "2017-01-26T04:01:00Z",
            "arrivalTime": "2017-01-26T10:21:00Z"
        },
        {
            "flightNumber": 453,
            "sourceAirport": "SFO",
            "destinationAirport": "IAD",
            "departureTime": "2017-01-26T04:00:00Z",
            "arrivalTime": "2017-01-26T10:24:00Z"
        }
    ]
    
Given these flights, a customer at the desk in SFO who wants to get to IAD should follow this
itinerary:

    Board flight 117 to depart SFO at 2017-01-25T22:17:05Z and arrive at OAK at 2017-01-25T22:21:00Z.
    Board flight 451 to depart OAK at 2017-01-26T04:01:00Z and arrive at IAD at 2017-01-26T10:21:00Z.
    
One final requirement- an itinerary is not valid if the customer doesn’t have at least 20 minutes
to get between their arrival gate and their departure gate during a layover. Since the layover at
OAK in the above example is longer than 20 minutes, the above itinerary is valid.