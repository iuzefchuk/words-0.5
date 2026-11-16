package main

import (
	"context"
	"encoding/json/v2"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net"
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
	readTimeout       = 30 * time.Second
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
		if errors.Is(err, flag.ErrHelp) {
			return nil
		}
		return err
	}
	port, err := resolvePort(getenv("SERVER_PORT"))
	if err != nil {
		return err
	}
	if flags.Arg(0) == "healthcheck" {
		return healthcheck(ctx, port)
	}
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	eng, err := engine.Open(*engineDir)
	if err != nil {
		return err
	}
	var listenConfig net.ListenConfig
	listener, err := listenConfig.Listen(ctx, "tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}
	server := &http.Server{
		Handler:           api.New(eng),
		IdleTimeout:       idleTimeout,
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
	}
	served := make(chan error, 1)
	go func() {
		served <- server.Serve(listener)
	}()
	slog.Info("server listening", "url", fmt.Sprintf("http://localhost:%d/", port))
	select {
	case err := <-served:
		return err
	case <-ctx.Done():
		slog.Info("server stopping", "cause", context.Cause(ctx))
		shutdownCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), shutdownTimeout)
		defer cancel()
		return server.Shutdown(shutdownCtx)
	}
}

func resolvePort(value string) (int, error) {
	if value == "" {
		return defaultPort, nil
	}
	port, err := strconv.ParseUint(value, 10, 16)
	if err != nil || port == 0 {
		return 0, fmt.Errorf("SERVER_PORT %q is not a port number", value)
	}
	return int(port), nil
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
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("boot responded %s", response.Status)
	}
	var boot struct {
		IsReady bool `json:"isReady"`
	}
	if err := json.UnmarshalRead(response.Body, &boot); err != nil {
		return err
	}
	if !boot.IsReady {
		return errors.New("engine is not ready")
	}
	return nil
}
