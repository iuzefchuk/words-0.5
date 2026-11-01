package engine

import (
	"encoding/binary"
	"errors"
	"unsafe"
)

const headerLength = 5

func (e *Engine) read(pointer unsafe.Pointer) ([]byte, error) {
	if pointer == nil {
		return nil, errors.New("engine returned no buffer")
	}
	header := unsafe.Slice((*byte)(pointer), headerLength)
	status := header[0]
	length := binary.LittleEndian.Uint32(header[1:])
	payload := make([]byte, length)
	copy(payload, unsafe.Slice((*byte)(unsafe.Add(pointer, headerLength)), length))
	e.dealloc(pointer)
	if status != 0 {
		return nil, errors.New(string(payload))
	}
	return payload, nil
}

func (e *Engine) callWithBytes(input []byte, call func(unsafe.Pointer) unsafe.Pointer) ([]byte, error) {
	if len(input) == 0 {
		return e.read(call(nil))
	}
	pointer := e.alloc(uint32(len(input)))
	if pointer == nil {
		return nil, errors.New("engine returned no input buffer")
	}
	copy(unsafe.Slice((*byte)(pointer), len(input)), input)
	return e.read(call(pointer))
}

func (e *Engine) callWithString(input string, call func(unsafe.Pointer) unsafe.Pointer) ([]byte, error) {
	return e.callWithBytes([]byte(input), call)
}
