package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"server/internal/api"
	"server/internal/engine"
)

const (
	defaultPort       = 5678
	defaultEngineDir  = "../engine"
	idleTimeout       = 120 * time.Second
	readHeaderTimeout = 10 * time.Second
	shutdownTimeout   = 5 * time.Second
	healthTimeout     = 5 * time.Second
)

func main() {
	if err := run(context.Background(), os.Args[1:], os.Getenv); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(ctx context.Context, args []string, getenv func(string) string) error {
	flags := flag.NewFlagSet("server", flag.ContinueOnError)
	engineDir := flags.String("engine", defaultEngineDir, "directory of the engine crate")
	if err := flags.Parse(args); err != nil {
		return err
	}
	port, err := resolvePort(getenv("SERVER_PORT"))
	if err != nil {
		return err
	}
	if flags.Arg(0) == "healthcheck" {
		return healthcheck(ctx, port)
	}
	eng, err := engine.Open(*engineDir)
	if err != nil {
		return err
	}
	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           api.New(eng),
		IdleTimeout:       idleTimeout,
		ReadHeaderTimeout: readHeaderTimeout,
	}
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	served := make(chan error, 1)
	go func() {
		slog.Info("server listening", "url", fmt.Sprintf("http://localhost:%d/", port))
		served <- server.ListenAndServe()
	}()
	select {
	case err := <-served:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		return server.Shutdown(shutdownCtx)
	}
}

func resolvePort(value string) (int, error) {
	if value == "" {
		return defaultPort, nil
	}
	port, err := strconv.Atoi(value)
	if err != nil || port <= 0 {
		return 0, errors.New("SERVER_PORT is invalid.")
	}
	return port, nil
}

func healthcheck(ctx context.Context, port int) error {
	ctx, cancel := context.WithTimeout(ctx, healthTimeout)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("http://localhost:%d/api/boot", port), nil)
	if err != nil {
		return err
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	var boot struct {
		IsReady bool `json:"isReady"`
	}
	if err := json.NewDecoder(response.Body).Decode(&boot); err != nil {
		return err
	}
	if !boot.IsReady {
		return errors.New("engine is not ready")
	}
	return nil
}
