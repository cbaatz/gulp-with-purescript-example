module Demo.Hello where

import Data.String (joinWith)

foreign import salutation :: String -> String

greeting :: String -> String
greeting name = joinWith " " [salutation name, "Nice weather we're having."]
