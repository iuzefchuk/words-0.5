package api

import (
	"crypto/rand"
	"encoding/binary"
	"log/slog"
	"sync"
	"time"

	"server/internal/engine"
)

const (
	idleTimeout = 24 * time.Hour
	maxSessions = 1000
)

type session struct {
	app      *engine.App
	lastSeen time.Time
}

type sessions struct {
	byClientID map[string]*session
	engine     *engine.Engine
	mu         sync.Mutex
}

func newSessions(eng *engine.Engine) *sessions {
	return &sessions{byClientID: make(map[string]*session), engine: eng}
}

func (s *sessions) open(clientID string) (*engine.App, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	current, ok := s.byClientID[clientID]
	if !ok {
		app, err := s.engine.NewApp(newSeed())
		if err != nil {
			return nil, err
		}
		current = &session{app: app}
		s.byClientID[clientID] = current
	}
	current.lastSeen = now
	s.evict(now)
	return current.app, nil
}

func (s *sessions) evict(now time.Time) {
	for id, current := range s.byClientID {
		if now.Sub(current.lastSeen) >= idleTimeout {
			s.close(id)
		}
	}
	for len(s.byClientID) > maxSessions {
		oldest := ""
		for id, current := range s.byClientID {
			if oldest == "" || current.lastSeen.Before(s.byClientID[oldest].lastSeen) {
				oldest = id
			}
		}
		s.close(oldest)
	}
}

func (s *sessions) close(id string) {
	if err := s.byClientID[id].app.Close(); err != nil {
		slog.Warn("closing evicted session failed", "error", err)
	}
	delete(s.byClientID, id)
}

func newSeed() uint32 {
	var bytes [4]byte
	rand.Read(bytes[:])
	return binary.LittleEndian.Uint32(bytes[:])
}
