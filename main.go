/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

package main

import "github.com/keisukehonda/bookshelf/cmd"

func main() {
	cmd.Execute()
}
*/
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"

    "github.com/keisukehonda/bookshelf/gen/greet/v1/greetv1connect"
    greetv1 "github.com/keisukehonda/bookshelf/gen/greet/v1"

    "github.com/bufbuild/connect-go"
    "golang.org/x/net/http2"
    "golang.org/x/net/http2/h2c"
)

type GreetServer struct{}

func (s *GreetServer) Greet(
    ctx context.Context,
    req *connect.Request[greetv1.GreetRequest],
) (*connect.Response[greetv1.GreetResponse], error) {
    log.Println("Request headers: ", req.Header())
    res := connect.NewResponse(&greetv1.GreetResponse{
        Greeting: fmt.Sprintf("Hello, %s!", req.Msg.Name),
    })
    res.Header().Set("Greet-Version", "v1")
    return res, nil
}

func main() {
    greeter := &GreetServer{}
    mux := http.NewServeMux()
    path, handler := greetv1connect.NewGreetServiceHandler(greeter)
    mux.Handle(path, handler)
    http.ListenAndServe(
        "localhost:8080",
        // Use h2c so we can serve HTTP/2 without TLS.
        h2c.NewHandler(mux, &http2.Server{}),
    )
}